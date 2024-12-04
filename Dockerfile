FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the entire project into the container [TODO: optimize caching]
COPY . .

RUN ./gradlew build --no-daemon
EXPOSE 8080
CMD ["java", "-jar", "build/libs/chess-webapp-0.0.1-SNAPSHOT.jar"]
