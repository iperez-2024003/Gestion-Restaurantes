const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if(file.endsWith('.js')) filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('./src');

const dictionary = {
  'Order created successfully': 'Orden creada exitosamente',
  'Order created successfully (inventory deducted)': 'Orden creada exitosamente (inventario descontado)',
  'Internal server error while creating order': 'Error interno al crear la orden',
  'Restaurant not found': 'Restaurante no encontrado',
  'User not found': 'Usuario no encontrado',
  'Order must contain at least one item': 'La orden debe contener al menos un artículo',
  'This restaurant does not offer delivery': 'Este restaurante no ofrece servicio a domicilio',
  'Delivery address is required for delivery orders': 'Se requiere dirección de entrega',
  'This restaurant does not offer takeout': 'Este restaurante no ofrece para llevar',
  'Menu item not found or not available': 'Platillo no encontrado o no disponible',
  'is currently unavailable': 'no está disponible actualmente',
  'Insufficient stock for': 'Inventario insuficiente para',
  'Only': 'Solo quedan',
  'remaining': 'en stock',
  'Order cancelled successfully': 'Orden cancelada exitosamente',
  'Order cancelled successfully and stock returned': 'Orden cancelada exitosamente y stock devuelto',
  'Cannot cancel order with status': 'No se puede cancelar orden con estado',
  'Order not found': 'Orden no encontrada',
  'Reporte generado y enviado exitosamente': 'Reporte generado y enviado exitosamente', // already spanish
  'Peak hours retrieved successfully': 'Horas pico obtenidas exitosamente',
  'Frequent customers retrieved successfully': 'Clientes frecuentes obtenidos exitosamente',
  'Internal server error': 'Error interno del servidor',
  'Orders retrieved successfully': 'Órdenes obtenidas exitosamente',
  'Order retrieved successfully': 'Orden obtenida exitosamente'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for(const [eng, spa] of Object.entries(dictionary)) {
    if(content.includes(eng)) {
      content = content.replace(new RegExp(eng, 'g'), spa);
      changed = true;
    }
  }

  // General regex for 'retrieved successfully' -> 'obtenido exitosamente'
  const rep1 = /([A-Za-z]+) retrieved successfully/g;
  if(rep1.test(content)) {
    content = content.replace(rep1, '$1 obtenido(a) exitosamente');
    changed = true;
  }
  
  // 'not found'
  const rep2 = /([A-Za-z]+) not found/g;
  if(rep2.test(content)) {
    content = content.replace(rep2, '$1 no encontrado(a)');
    changed = true;
  }

  // 'created successfully'
  const rep3 = /([A-Za-z]+) created successfully/g;
  if(rep3.test(content)) {
    content = content.replace(rep3, '$1 creado(a) exitosamente');
    changed = true;
  }

  // 'updated successfully'
  const rep4 = /([A-Za-z]+) updated successfully/g;
  if(rep4.test(content)) {
    content = content.replace(rep4, '$1 actualizado(a) exitosamente');
    changed = true;
  }
  
  // 'deleted successfully'
  const rep5 = /([A-Za-z]+) deleted successfully/g;
  if(rep5.test(content)) {
    content = content.replace(rep5, '$1 eliminado(a) exitosamente');
    changed = true;
  }

  if(changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Translated messages in ${file}`);
  }
});
