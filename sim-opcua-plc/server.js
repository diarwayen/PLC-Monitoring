/* * Basit OPC UA Simülatörü 
 * Amaç: Node-RED'in okuması için sahte sensör verisi üretmek.
 */

const opcua = require("node-opcua");
const chalk = require("chalk"); // Konsol renkleri için

const port = 4840;

async function main() {
    try {
        // 1. Server Oluşturma
        const server = new opcua.OPCUAServer({
            port: port,
            resourcePath: "/UA/Simulation",
            buildInfo: {
                productName: "SimulatedPLC",
                buildNumber: "1",
                buildDate: new Date()
            }
        });

        await server.initialize();
        console.log(chalk.yellow("OPC UA Server başlatılıyor..."));

        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // 2. Cihaz Tanımlama (Örn: Bir CNC Makinesi)
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "Machine_01"
        });

        // 3. Değişkenleri Tanımlama (Simüle edilecek veriler)
        
        // Değişken 1: Sıcaklık (Temperature) - Double
        let temperature = 20.0;
        namespace.addVariable({
            componentOf: device,
            browseName: "Temperature",
            dataType: "Double",
            value: {
                get: function () {
                    // Simülasyon: Sıcaklığı rastgele biraz artır/azalt
                    const change = (Math.random() - 0.5) * 2.0; 
                    temperature += change;
                    if (temperature < 15) temperature = 15;
                    if (temperature > 100) temperature = 100;
                    return new opcua.Variant({ dataType: opcua.DataType.Double, value: temperature });
                }
            }
        });

        // Değişken 2: Titreşim (Vibration) - Double
        // Sinüs dalgası şeklinde değişsin
        let angle = 0;
        namespace.addVariable({
            componentOf: device,
            browseName: "Vibration",
            dataType: "Double",
            value: {
                get: function () {
                    angle += 0.1;
                    const vibration = 2.0 + Math.sin(angle) * 1.5; // 0.5 ile 3.5 arası gezer
                    return new opcua.Variant({ dataType: opcua.DataType.Double, value: vibration });
                }
            }
        });

        // Değişken 3: Makine Durumu (IsActive) - Boolean
        namespace.addVariable({
            componentOf: device,
            browseName: "IsActive",
            dataType: "Boolean",
            value: {
                get: function () {
                    return new opcua.Variant({ dataType: opcua.DataType.Boolean, value: true });
                }
            }
        });

        // 4. Server'ı Başlat
        await server.start();
        console.log(chalk.green(`Server başlatıldı!`));
        console.log(`Endpoint: ${chalk.cyan(server.getEndpointUrl())}`);
        console.log("Ctrl+C ile durdurabilirsiniz.");

    } catch (err) {
        console.log(chalk.red("Server başlatılamadı:"), err);
    }
}

main();