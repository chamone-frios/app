import { Alert, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { postProduct } from "../_api/http";
import { ProductForm } from "../_components/product-form";
import { Product, ProductMetric } from "pages/api/v1/products/_constants/types";

const AddProduct = () => {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: postProduct,
  });

  const initialState: Omit<Product, "id" | "img"> = {
    name: "",
    description: "",
    maker: "",
    metric: ProductMetric.UNIT,
    price: 0.0,
    stock: 0,
  };

  return (
    <Stack spacing={4}>
      <Typography variant="hero-sm">Adicionar produto</Typography>
      <Alert severity={isSuccess ? "success" : isError ? "error" : "info"}>
        {isSuccess
          ? "Produto adicionado!"
          : isError
            ? "Erro ao adicionar produto."
            : "Preencha corretamente antes de adicionar o produto."}
      </Alert>
      <ProductForm
        isLoading={isPending}
        initialState={initialState}
        submitButtonText="Adicionar produto"
        onSubmit={mutate}
      />
    </Stack>
  );
};

export default AddProduct;
