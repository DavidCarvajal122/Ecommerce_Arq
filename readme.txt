Instalar node.js

1.-
cd users-services
npm init -y
npm i express mongoose cors
npm i -D nodemon

2.-
cd ../orders-service
npm init -y
npm i express mongoose cors
npm i -D nodemon

Si queremos publicar a RabbitMQ, agregamos npm i amqplib 

En la raiz del proyecto en la terminal ejecutar este comando docker compose up -d --build

docker compose logs -f users-service