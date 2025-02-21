# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17-slim AS build

WORKDIR /app

COPY pom.xml .

RUN mvn clean -DskipTests 

RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn package

# Stage 2: Run the application
FROM maven:3.8.3-openjdk-17-slim

WORKDIR /app

COPY --from=build /app .

EXPOSE 8080

ENTRYPOINT ["mvn", "spring-boot:run"]