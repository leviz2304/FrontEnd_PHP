// tests/user.test.js
import request from "supertest";
import mongoose from "mongoose";
import app from "../server"; // Giả sử bạn export app từ server.js

describe("User Authentication", () => {
  // Sử dụng cơ sở dữ liệu test, ví dụ: MONGO_URI_TEST trong .env
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase(); // Xoá dữ liệu test
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

    it("should return error for invalid credentials", async () => {
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

  // Bạn có thể viết thêm các test khác như adminLogin nếu cần
});
