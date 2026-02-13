/* eslint-disable no-console */
const opcua = require("node-opcua");

const PORT = 4840; 
const MACHINE_TYPE = process.env.MACHINE_TYPE || "GENERIC"; 
const MACHINE_ID = process.env.MACHINE_ID || "001";

const PROFILES = {
  CNC: { tempBase: 60, tempVariance: 15, pressureBase: 5, pressureVariance: 1, speedBase: 1200, speedVariance: 200 },
  PRESS: { tempBase: 40, tempVariance: 5, pressureBase: 150, pressureVariance: 40, speedBase: 10, speedVariance: 2 },
  ROBOT: { tempBase: 35, tempVariance: 10, pressureBase: 0, pressureVariance: 0, speedBase: 50, speedVariance: 50 }
};

const profile = PROFILES[MACHINE_TYPE] || PROFILES.CNC;

function generateValue(base, variance) {
  if (variance === 0) return base;
  const factor = (Math.random() - 0.5) * 2; 
  return base + (factor * variance);
}

(async () => {
  try {
    const server = new opcua.OPCUAServer({
      port: PORT,
      resourcePath: "/UA/Machine",
      buildInfo: {
        productName: `Simulated ${MACHINE_TYPE}`,
        buildNumber: "1",
        buildDate: new Date(),
      },
    });

    await server.initialize();
    const addressSpace = server.engine.addressSpace;
    
    // DÜZELTME: Kendi namespace'ini oluşturmak yerine (ns=2),
    // Mevcut olan Namespace 1'i (Sunucu Alanı) alıyoruz.
    const namespace = addressSpace.getNamespace(1);

    const device = namespace.addObject({
      organizedBy: addressSpace.rootFolder.objects,
      browseName: `${MACHINE_TYPE}_${MACHINE_ID}`,
    });

    // --- 1. SICAKLIK (Temperature) [ns=1;i=1001] ---
    let tempVal = profile.tempBase;
    namespace.addVariable({
      componentOf: device,
      nodeId: "ns=1;i=1001", // BURASI ARTIK 1
      browseName: "Temperature",
      dataType: "Double",
      value: {
        get: () => {
          tempVal += (Math.random() - 0.5) * 2;
          return new opcua.Variant({ dataType: opcua.DataType.Double, value: parseFloat(tempVal.toFixed(1)) });
        }
      }
    });

    // --- 2. BASINÇ (Pressure) [ns=1;i=1002] ---
    namespace.addVariable({
      componentOf: device,
      nodeId: "ns=1;i=1002", // BURASI ARTIK 1
      browseName: "Pressure",
      dataType: "Double",
      value: {
        get: () => {
          const val = generateValue(profile.pressureBase, profile.pressureVariance);
          return new opcua.Variant({ dataType: opcua.DataType.Double, value: parseFloat(val.toFixed(1)) });
        }
      }
    });

    // --- 3. HIZ (Speed) [ns=1;i=1003] ---
    namespace.addVariable({
      componentOf: device,
      nodeId: "ns=1;i=1003", // BURASI ARTIK 1
      browseName: "Speed",
      dataType: "Int32",
      value: {
        get: () => {
          let val = generateValue(profile.speedBase, profile.speedVariance);
          if(MACHINE_TYPE === 'ROBOT' && Math.random() > 0.8) val = 0;
          return new opcua.Variant({ dataType: opcua.DataType.Int32, value: Math.round(val) });
        }
      }
    });

    await server.start();
    console.log(`[${MACHINE_TYPE}] (ns=1) Simülasyonu Başladı! Port: ${PORT}`);
    console.log(`Endpoint: opc.tcp://0.0.0.0:${PORT}/UA/Machine`);

  } catch (err) {
    console.log("Sunucu hatası:", err);
  }
})();