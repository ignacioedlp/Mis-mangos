# Instrucciones para Aplicar el Borrado en Cascada

## 🔄 Migración de Base de Datos Requerida

Para que el borrado en cascada funcione correctamente, necesitas aplicar una migración a tu base de datos. Esto cambiará las restricciones de clave foránea de `RESTRICT` a `CASCADE`.

## 📋 Pasos para Aplicar la Migración

### 1. Asegúrate de tener conexión a la base de datos

Verifica que tu archivo `.env` tenga las variables de conexión correctas:

```bash
DATABASE_URL="tu_url_de_base_de_datos"
DIRECT_URL="tu_url_directa_de_base_de_datos"
```

### 2. Generar la migración

Ejecuta el siguiente comando en tu terminal:

```bash
npx prisma migrate dev --name add_cascade_delete
```

### 3. Aplicar la migración (si ya tienes datos)

Si ya tienes datos en tu base de datos, es posible que necesites ejecutar:

```bash
npx prisma db push
```

### 4. Verificar que la migración se aplicó

Puedes verificar que la migración se aplicó correctamente ejecutando:

```bash
npx prisma studio
```

Y revisando las relaciones en la interfaz gráfica.

## ⚠️ Importante: Backup de Datos

**ANTES de aplicar la migración, asegúrate de hacer un backup de tu base de datos**, especialmente si tienes datos importantes.

## 🔍 Qué Cambió

Los cambios en el esquema fueron:

```prisma
// ANTES (Restrict - no permitía eliminar)
category      Category     @relation(fields: [categoryId], references: [id], onDelete: Restrict)
subcategory   Subcategory  @relation(fields: [subcategoryId], references: [id], onDelete: Restrict)

// DESPUÉS (Cascade - elimina automáticamente)
category      Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)
subcategory   Subcategory  @relation(fields: [subcategoryId], references: [id], onDelete: Cascade)
```

## 🚀 Funcionalidades Nuevas

Después de aplicar la migración, tendrás:

1. **Borrado en Cascada**: Al eliminar una categoría o subcategoría, se eliminan automáticamente todos los gastos relacionados
2. **Diálogos de Confirmación**: Ventanas que te muestran exactamente qué se eliminará antes de confirmar
3. **Mensajes Informativos**: El sistema te dice cuántos elementos se eliminarán en cascada
4. **Interfaz Mejorada**: Botones de eliminación más seguros y informativos

## 🔧 Si Tienes Problemas

Si encuentras errores al aplicar la migración:

1. **Error de conexión**: Verifica que tu base de datos esté funcionando
2. **Error de permisos**: Asegúrate de tener permisos para modificar el esquema
3. **Error de datos existentes**: Es posible que tengas datos que violan las nuevas restricciones

En caso de problemas, puedes contactar al desarrollador o revisar los logs de Prisma para más detalles.
