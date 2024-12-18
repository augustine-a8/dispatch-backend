import { Options } from "swagger-jsdoc";
import { config } from "./config";

export const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Mail API",
      version: "1.0.0",
      description: "API documentation for Mail service",
    },
    servers: [
      {
        url: `${
          process.env.NODE_ENV === "production"
            ? config.serverUrl
            : "http://localhost"
        }:${config.port}`,
        description: "Local server",
      },
    ],
    components: {
      schemas: {
        AddNewMail: {
          type: "object",
          properties: {
            referenceNumber: { type: "string" },
            addressees: {
              type: "array",
              items: { type: "string" },
            },
            organization: { type: "string" },
          },
          required: ["referenceNumber", "addressees", "organization"],
        },
        DispatchMail: {
          type: "object",
          properties: {
            driverId: { type: "string" },
            referenceNumbers: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["driverId", "referenceNumbers"],
        },
        ReceiveMail: {
          type: "object",
          properties: {
            recipient: { type: "string" },
            recipientContact: { type: "string" },
            recipientSignatureUrl: { type: "string" },
          },
          required: ["recipient", "recipientContact", "recipientSignatureUrl"],
        },
        AddNewDriver: {
          type: "object",
          properties: {
            name: { type: "string" },
            contact: { type: "string" },
          },
          required: ["name", "contact"],
        },
        Mail: {
          type: "object",
          properties: {
            id: { type: "number" },
            mailId: { type: "string" },
            referenceNumber: { type: "string" },
            date: { type: "string", format: "date-time" },
            organization: { type: "string" },
            addressee: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "transit", "delivered", "failed"],
            },
            driverId: { type: "string" },
            driver: {
              $ref: "#/components/schemas/User",
            },
            recipient: { type: "string" },
            recipientContact: { type: "string" },
            receivedAt: { type: "string", format: "date-time" },
            receipientSignatureUrl: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "string" },
            name: { type: "string" },
            contact: { type: "string" },
            role: { type: "string", enum: ["admin", "driver"] },
            unhashedPassword: { type: "string" },
          },
        },
        MailLog: {
          type: "object",
          properties: {
            id: { type: "integer" },
            mailLogId: { type: "string" },
            mailId: { type: "string" },
            mail: {
              $ref: "#/components/schemas/Mail",
            },
            status: {
              type: "string",
              enum: ["pending", "transit", "delivered", "failed"],
            },
            date: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.{ts,js}"],
};
