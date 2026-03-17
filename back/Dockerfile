# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder


WORKDIR /app

# Cache des dépendances Maven (layer séparé pour les rebuilds rapides)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Compilation + package (sans tests — ils nécessitent une DB)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2 : Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
