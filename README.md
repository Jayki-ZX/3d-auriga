# Eolian 3D

## Setup

```
npm install
npm start
```

## Guia general

Para empezar el repo segui este video [video](https://www.youtube.com/watch?v=z9qtGHTqLqQ)

La aplicacion la saque de este ejemplo:

* [cargar_modelos](https://threejs.org/examples/?q=obj#webgl_loader_obj_mtl)

* [import_gltf](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

El flujo de la app es el siguiente:

`3dauriga.js -> index.html -> app.js -> localhost:3000`

## TODO

Esto tambien quedo en todo.md

[] Agregar algun fondo

[] Agregar controles de camara (trackball controls u orbit controls):
 
 * Que el auto gire en 360.
 * Con el punto focal en el centro del auto.
 * Zoom?

[] Iluminar la pieza en la cual esta el mouse:

  * Lanzar un rayo usando raycast
  * Tomar la lista intersectada y hacerle modificaciones al primero (intersected[0])
  * Reestablecer una pieza a su color original al sacar el mouse de encima

[] Probar en celu

[] Window resize support (que no se muera al hacerle resize)

[] Deployear en algun lado