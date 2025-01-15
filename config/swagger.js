

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
const endpointsFiles = ["./app/routes.ts", "./app/user/user.route.ts"];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log("Swagger documentation generated!");
});