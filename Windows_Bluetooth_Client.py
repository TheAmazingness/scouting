# Written By Liam Wang and Dylan Smith
# Currently, Only Works For Pit Scouting App & Windows Computers

from bluetooth import *
import sys, time

if sys.version < '3':
    input = raw_input

if not len(sys.argv) == 4:
    raise ValueError('Too few/many arguments specified!\nUsage: '+sys.argv[0]+' <device_address> <message>')

uuid = sys.argv[1]
addr = sys.argv[2]
if not is_valid_address(addr):
    addr = None
message = sys.argv[3]


service_matches = find_service(uuid=uuid, address=addr)

if len(service_matches) == 0:
    addr = None
    service_matches = find_service(uuid=uuid, address=addr)
    if len(service_matches) == 0:
        raise ValueError('Server not found! Make sure address and uuid of the server match, and that the server is running!')

first_match = service_matches[0]
port = first_match["port"]
host = first_match["host"]

# Create the client socket
sock = BluetoothSocket(RFCOMM)
sock.connect((host, port))

sock.send(message)
time.sleep(.1)
sock.send("end")

sock.close()
