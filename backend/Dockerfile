# Al-Nass Insights API (.NET 10)
# Build context: ./backend

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY global.json Directory.Build.props AlNass.Insights.slnx ./
COPY src/ ./src/
COPY tests/ ./tests/
RUN dotnet restore AlNass.Insights.slnx
RUN dotnet publish src/Insights.Presentation/Insights.Presentation.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_EnableDiagnostics=0

USER root
# Healthcheck client (image has neither wget nor curl by default)
RUN if command -v tdnf >/dev/null 2>&1; then \
      tdnf install -y curl && tdnf clean all; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update \
      && apt-get install -y --no-install-recommends curl \
      && rm -rf /var/lib/apt/lists/*; \
    else \
      echo "No supported package manager for curl" && exit 1; \
    fi

USER $APP_UID
COPY --from=build /app/publish .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=5 \
  CMD curl -fsS http://127.0.0.1:8080/health/live || exit 1
ENTRYPOINT ["dotnet", "Insights.Presentation.dll"]
