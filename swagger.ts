const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My API",
    description: "API documentation for my application",
  },
  host: "localhost:5000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./messageRoutes.ts", "./userRoutes.ts"];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log("Swagger documentation generated!");
});