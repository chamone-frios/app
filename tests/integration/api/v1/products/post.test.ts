import { clearDatabase, runMigrations } from "tests/utils";
import { Product, ProductMetric } from "pages/api/v1/products/_constants/types";

describe("POST /api/v1/products", () => {
  beforeAll(async () => {
    await clearDatabase();
    await runMigrations();
  });

  afterAll(async () => {
    await clearDatabase().then(async () => await runMigrations());
  });

  it("should create a new product when all fields are valid", async () => {
    const productData: Omit<Product, "id"> = {
      name: "Test Product",
      img: "test-image.jpg",
      description: "Test product description",
      maker: "Test Maker",
      metric: ProductMetric.UNIT,
      stock: 10,
      price: 100,
    };

    const response = await fetch("http://localhost:3000/api/v1/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    expect(response.status).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    const getResponse = await fetch(`http://localhost:3000/api/v1/products`);
    const products = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(products.products)).toBeTruthy();

    const createdProduct = products.products.find(
      (p) => p.id === responseData.id,
    );
    expect(createdProduct).toBeDefined();
    expect(createdProduct.name).toBe(productData.name);
    expect(createdProduct.description).toBe(productData.description);
    expect(createdProduct.maker).toBe(productData.maker);
    expect(createdProduct.stock).toBe(productData.stock);
  });

  it("should return 400 when required fields are missing", async () => {
    const incompleteData = {
      name: "Incomplete Product",
    };

    const response = await fetch("http://localhost:3000/api/v1/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(incompleteData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe("Missing required fields");
  });

  it("should return 400 when metric is invalid", async () => {
    const invalidMetricData = {
      name: "Invalid Metric Product",
      img: "invalid-metric.jpg",
      description: "Product with invalid metric",
      maker: "Test Maker",
      metric: 99,
      stock: 5,
      price: 99,
    };

    const response = await fetch("http://localhost:3000/api/v1/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidMetricData),
    });

    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData.error).toBe("Invalid metric value");
  });

  it("should accept all valid metric types", async () => {
    for (const metricType of [
      ProductMetric.UNIT,
      ProductMetric.KG,
      ProductMetric.G,
      ProductMetric.L,
    ]) {
      const productData = {
        name: `Metric Test ${ProductMetric[metricType]}`,
        img: "metric-test.jpg",
        description: `Testing metric type: ${ProductMetric[metricType]}`,
        maker: "Metric Tester",
        metric: metricType,
        stock: 15,
        price: 100,
      };

      const response = await fetch("http://localhost:3000/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
    }
  });

  it("should return 405 for non-POST methods", async () => {
    const response = await fetch("http://localhost:3000/api/v1/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    });

    expect(response.status).toBe(405);

    const responseData = await response.json();
    expect(responseData.error).toBe("Method not allowed");
  });
});
