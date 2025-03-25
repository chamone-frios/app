import { clearDatabase, runMigrations } from "tests/utils";
import {
  Product,
  ProductMetric,
} from "../../../../../../pages/api/v1/products/_constants/types";

describe("PATCH /api/v1/products/[id]", () => {
  let createdProductId: string;
  const updatedProduct: Omit<Product, "id"> = {
    img: "updated-test.jpg",
    name: "Updated Test Product",
    description: "Updated Description",
    maker: "Updated Maker",
    metric: ProductMetric.KG,
    stock: 20,
    price: 149.99,
  };

  beforeEach(async () => {
    await clearDatabase();
    await runMigrations();

    const productToCreate: Omit<Product, "id"> = {
      name: "Test Product for PATCH",
      img: "test-patch.jpg",
      description: "Product for testing PATCH",
      maker: "Test Maker",
      metric: ProductMetric.UNIT,
      stock: 10,
      price: 99.99,
    };

    const createResponse = await fetch(
      "http://localhost:3000/api/v1/products",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToCreate),
      },
    );

    const createData = await createResponse.json();
    createdProductId = createData.id;
  });

  afterAll(async () => {
    await clearDatabase().then(async () => await runMigrations());
  });

  it("should return 500 when product doesn't exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${nonExistentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      },
    );

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should return 400 when product data is invalid", async () => {
    const invalidProduct = {
      name: "",
      description: "Updated Description",
      maker: "Updated Maker",
      metric: 999,
      stock: -5,
      price: 0,
    };

    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProduct),
      },
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Invalid data");
    expect(data).toHaveProperty("details");
    expect(Array.isArray(data.details)).toBe(true);
    expect(data.details.length).toBeGreaterThan(0);
  });

  it("should successfully update a product with valid data", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      },
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data.id).toBe(createdProductId);
  });

  it("should confirm the product was actually updated", async () => {
    await fetch(`http://localhost:3000/api/v1/products/${createdProductId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("product");

    const product = data.product;
    expect(product.name).toBe("Updated Test Product");
    expect(product.description).toBe("Updated Description");
    expect(product.maker).toBe("Updated Maker");
    expect(product.metric).toBe(ProductMetric.KG);
    expect(product.stock).toBe(20);
    expect(parseFloat(product.price)).toBe(149.99);
  });

  it("should trigger error when try to update a product with only some fields", async () => {
    const partialUpdate = {
      name: "Partially Updated Product",
      price: 129.99,
    };

    const updateResponse = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partialUpdate),
      },
    );

    expect(updateResponse.status).toBe(400);

    const errorData = await updateResponse.json();
    expect(errorData).toHaveProperty("error");
    expect(errorData.error).toBe("Invalid data");
  });

  it("should handle method not allowed", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/products/${createdProductId}`,
      { method: "PUT" },
    );

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Method not allowed");
  });
});
