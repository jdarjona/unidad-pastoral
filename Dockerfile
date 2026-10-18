FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/UnidadPastoral.Api/UnidadPastoral.Api.csproj src/UnidadPastoral.Api/
RUN dotnet restore src/UnidadPastoral.Api/UnidadPastoral.Api.csproj
COPY src/ src/
WORKDIR /src/src/UnidadPastoral.Api
RUN dotnet publish UnidadPastoral.Api.csproj --configuration Release --output /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "UnidadPastoral.Api.dll"]