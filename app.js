const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))
app.use('/ensamble/', express.static(path.join(__dirname, 'public/ensamble')))
app.use('/public/', express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 8080;
console.log("Fenix 3D");
app.listen(port, () => console.log('Visit http://127.0.0.1:',port))
