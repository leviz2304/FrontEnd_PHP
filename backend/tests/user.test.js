// tests/user.test.js
import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" }); // Nạp biến môi trường từ file .env.test
import app from "../server.js";

describe("User Authentication", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/user/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .send({
          name: "Test User",
          email: "testuser@example.com",
          password: "testpassword",
        });
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });

  describe("POST /api/user/login", () => {
    it("should login an existing user", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "testuser@example.com",
          password: "testpassword",
        });
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "testuser@example.com",
          password: "wrongpassword",
        });
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid Credentials/);
    });
  });
});
