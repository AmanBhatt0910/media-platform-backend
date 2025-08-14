const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Use the actual routes (import your app or mount routes on a small Express)
const authRoutes = require("../src/routes/authRoutes");
const mediaRoutes = require("../src/routes/mediaRoutes");

const { connect, closeDatabase, clearDatabase } = require("./setup");

// Mock Redis with ioredis-mock (when NODE_ENV=test, require redis mock)
jest.mock("ioredis", () => require("ioredis-mock"));

let app;

beforeAll(async () => {
  await connect();
  app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use("/media", mediaRoutes);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test("signup, login, add media, log view, analytics", async () => {
  // signup
  await request(app).post("/auth/signup").send({ email: "a@b.com", password: "secret" }).expect(201);

  const loginRes = await request(app).post("/auth/login").send({ email: "a@b.com", password: "secret" }).expect(200);
  const token = loginRes.body.token;
  expect(token).toBeDefined();

  // add media
  const addRes = await request(app)
    .post("/media")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Test", type: "video", file_url: "https://x/1.mp4" })
    .expect(201);

  const mediaId = addRes.body.media._id;

  // log view
  await request(app).post(`/media/${mediaId}/view`).set("Authorization", `Bearer ${token}`).expect(201);

  // analytics
  const analytics = await request(app).get(`/media/${mediaId}/analytics`).set("Authorization", `Bearer ${token}`).expect(200);
  expect(analytics.body.total_views).toBeGreaterThanOrEqual(1);
  expect(typeof analytics.body.unique_ips).toBe("number");
  expect(typeof analytics.body.views_per_day).toBe("object");
});
