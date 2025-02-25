import asyncio
import websockets
import redis 

redis_client = redis.Redis(
    host="dronautica-notifications-trnocq.serverless.use1.cache.amazonaws.com",
    port=6379,
    decode_responses=True, 
    ssl=True, 
    ssl_ca_certs="credentials/AWS_ca.pem"
)

async def connect():
    # State of the redis connection
    print(f"Redis connection state: {redis_client.ping()}")
    uri = "wss://12voeaacae.execute-api.us-east-1.amazonaws.com/development/"  # Replace with your WebSocket server URI
    async with websockets.connect(uri) as websocket:
        # action = "sendMessage", message = "Hello, Server!"
        await websocket.send('{"action": "sendMessage", "message": "Hello, Server!"}')
        print("Message sent to the server")

        while True:
            response = await websocket.recv()
            print(f"Message received from the server: {response}")

asyncio.get_event_loop().run_until_complete(connect())