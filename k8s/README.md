# Kubernetes deployment

These manifests target a Kubernetes cluster with an NGINX Ingress Controller and a default dynamic storage class.

## Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

Set a real JWT secret before deploying to a shared or production cluster:

```bash
kubectl -n lms create secret generic lms-secrets \
  --from-literal=JWT_SECRET='replace-with-a-long-random-value' \
  --dry-run=client -o yaml | kubectl apply -f -
```

Add `lms.local` to the cluster ingress IP in your hosts file, then open `http://lms.local`.

The manifests use the same images as `docker-compose.yml`. Build and push updated images when deploying local source changes:

```bash
docker build -f backend/Dockerfile -t f23rdocs1m01015/lms-backend:latest .
docker build -f frontend/Dockerfile -t f23rdocs1m01015/lms-frontend:latest .
docker push f23rdocs1m01015/lms-backend:latest
docker push f23rdocs1m01015/lms-frontend:latest
```
