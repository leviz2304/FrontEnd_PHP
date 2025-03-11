// tests/user.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); // Đảm bảo rằng server.js xuất ra app bằng module.exports = app

describe("User Authentication", () => {
  // Kết nối đến cơ sở dữ liệu test trước khi chạy test
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Sau khi test xong, xoá database và đóng kết nối
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
