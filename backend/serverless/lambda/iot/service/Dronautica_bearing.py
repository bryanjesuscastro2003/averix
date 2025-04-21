import json
import math


def calcular_bearing(lat1, lon1, lat2, lon2):
    
    #Calculo del bearing (rumbo) entre dos puntos geográficos.
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    delta_lon = lon2 - lon1
    x = math.sin(delta_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(delta_lon))
    bearing = math.atan2(x, y)
    bearing = math.degrees(bearing)
    return (bearing + 360) % 360

def calcular_giro(bearing_actual, nuevo_bearing):
    
    #Calcula el giro necesario para cambiar de un bearing a otro.

    giro = (nuevo_bearing - bearing_actual + 360) % 360
    if giro > 180:
        giro -= 360  # ajusta el dron para el giro mas corto
    return giro

def navegar_dron(lat_actual, lon_actual, lat_destino, lon_destino, bearing_actual):

    #Calcula el giro necesario para que el dron navegue hacia el destino.
    
    # Calcular el bearing hacia el destino
    bearing_destino = calcular_bearing(lat_actual, lon_actual, lat_destino, lon_destino)
    
    # Calcular el giro necesario
    giro = calcular_giro(bearing_actual, bearing_destino)
    
    return giro

def haversine(lat1, lon1, lat2, lon2):
   # Calcula la distancia (en kilómetros) entre dos puntos en la Tierra
    #dados sus valores de latitud y longitud en grados.
    
    # Convertir de grados a radianes
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Diferencias
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Fórmula de Haversine
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radio de la Tierra en kilómetros (puedes usar 3956 para millas)
    R = 6371
    distance = R * c
    return distance


def lambda_handler(event, context):
    try:
        # COORDINATES
        targetCoordinate = event.get("targetCoordinate")#"18.4901,-97.39427"
        originCoordinate = event.get("originCoordinate")#"18.49021,-97.39411"
        currentCoordinate = event.get("currentCoordinate")#"18.49021,-97.39411"#event.get("currentCoordinate")
        print(targetCoordinate, originCoordinate, currentCoordinate)
        bearing_actual = 0
        lat1, lon1 = map(float, currentCoordinate.split(","))
        lat2, lon2 = map(float, targetCoordinate.split(","))
        lat3, lon3 = map(float, originCoordinate.split(","))
        giro = navegar_dron(lat1, lon1, lat2, lon2, bearing_actual)
        distanciaAbs = haversine(lat3, lon3, lat2, lon2)
        distanciaRel = haversine(lat1, lon1, lat2, lon2)
        return {
            'statusCode': 200,
            'body': {
                "ok": True,
                "turningAngle": giro,
                "distanceAbs": distanciaAbs*1000, 
                "distanceRel": distanciaRel*1000
            }
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 400,
            'body': {
                "ok": False,
                "turningAngle": 0,
                "distanceAbs": 0, 
                "distanceRel": 0
            }
        }
