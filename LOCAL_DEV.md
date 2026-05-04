# Guía para desarrollo local — Architext

## Iniciar el proyecto (después de reiniciar la PC)

Abre una terminal en `H:\Archivos\Architec\architext` y ejecuta estos 2 comandos:

```bash
# 1. Iniciar PostgreSQL (portable, instalado en H:\PostgreSQL)
"H:\PostgreSQL\pgsql\bin\pg_ctl.exe" -D "H:\PostgreSQL\data" -l "H:\PostgreSQL\logfile.log" start

# 2. Iniciar el servidor de desarrollo
pnpm dev
```

Abre **http://localhost:3000** en el navegador.

## Primera vez después de clonar

```bash
pnpm install
npx prisma db push
pnpm dev
```

## Si algo falla

### PostgreSQL no inicia

```bash
# Ver el log:
cat H:\PostgreSQL\logfile.log
# Verificar si ya está corriendo:
"H:\PostgreSQL\pgsql\bin\pg_isready.exe"
```

### Puerto 3000 ocupado

```bash
taskkill /F /IM node.exe
pnpm dev
```

### Detener PostgreSQL

```bash
"H:\PostgreSQL\pgsql\bin\pg_ctl.exe" -D "H:\PostgreSQL\data" stop
```

## Datos importantes

- **Repo:** https://github.com/DelvyG/Architext
- **DB:** PostgreSQL 16 portable en `H:\PostgreSQL\` (datos persistentes en `H:\PostgreSQL\data\`)
- **Conexión:** `postgresql://postgres@localhost:5432/architext` (sin password, auth=trust)
- **Secrets:** Ya configurados en `.env` (AUTH_SECRET, ENCRYPTION_KEY)
- **Los datos NO se pierden** al reiniciar — PostgreSQL real con almacenamiento persistente

## Para pedirle a Claude que lo haga

Simplemente dile: "Inicia el proyecto local" y él ejecutará los comandos.
