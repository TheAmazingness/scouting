from bluetooth import *
import json
import urllib

server_sock = BluetoothSocket(RFCOMM)
server_sock.bind(("", PORT_ANY))
server_sock.listen(1)

port = server_sock.getsockname()[1]

uuid = "66216088-cc64-4a35-969f-58336ef03732"
directory = "data-collect/pit-scouting/"

advertise_service(server_sock, "SampleServer",
                  service_id=uuid,
                  service_classes=[uuid, SERIAL_PORT_CLASS],
                  profiles=[SERIAL_PORT_PROFILE],
                  #                   protocols = [ OBEX_UUID ]
                  )

print("Waiting for connection on RFCOMM channel %d" % port)

while True:
    client_sock, client_info = server_sock.accept()
    message = ""
    try:
        while True:
            data = client_sock.recv(1024)
            if data == "end": break
            message += data
    except IOError:
        pass

    message = urllib.unquote(message)
    print message
    jsonMessage = json.loads(message)

    name = jsonMessage["teamNumber"] + ".json"
    jsonFile = open(directory + name, "w+")
    jsonFile.write(message)
    jsonFile.close()

    if not os.path.isfile(directory + "manifest.json"):
        m = open(directory + "manifest.json", "w+")
        m.write("[]")
        m.close()
    manifest = open(directory + "manifest.json", "r")
    loads = json.loads(manifest.read())
    if not name in loads:
        loads.append(name)
        dumps = json.dumps(loads)
        manifest.close()
        manifest = open(directory + "manifest.json", "w")
        manifest.write(dumps)
    manifest.close()

    client_sock.close()
