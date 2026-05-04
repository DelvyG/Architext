# Guía para desarrollo local — Architext

## Iniciar el proyecto (después de reiniciar la PC)

Abre una terminal en `H:\Archivos\Architec\architext` y ejecuta estos 3 comandos en orden:

```bash
# 1. Levantar PostgreSQL local (embebido via Prisma)
npx prisma dev --detach

# 2. Aplicar el schema a la DB (solo si es la primera vez o si se borró)
npx prisma db push

# 3. Iniciar el servidor de desarrollo
pnpm dev
```

Abre **http://localhost:3000** en el navegador.

## Si algo falla

### "Lock file is already being held"

```bash
npx prisma dev rm default
npx prisma dev --detach
```

### "Can't reach database server"

El PostgreSQL local se cayó. Reinícialo:

```bash
npx prisma dev --detach
npx prisma db push
```

### Puerto 3000 ocupado

```bash
# En Windows PowerShell:
taskkill /F /IM node.exe
# Luego vuelve a ejecutar:
pnpm dev
```

## Datos importantes

- **Repo:** https://github.com/DelvyG/Architext
- **DB:** PostgreSQL local via `prisma dev` (se crea/destruye automáticamente, no requiere instalar nada)
- **Secrets:** Ya configurados en `.env` (AUTH_SECRET, ENCRYPTION_KEY)
- **Puerto DB:** Varía cada vez que inicias `prisma dev` — se auto-configura
- **Nota:** Cada vez que reinicias `prisma dev`, la DB se borra. Tendrás que crear cuenta nueva.

## Para pedirle a Claude que lo haga

Simplemente dile: "Inicia el proyecto local" y él ejecutará los 3 comandos.
