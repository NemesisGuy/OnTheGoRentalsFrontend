docker build --no-cache -f docker/Dockerfile -t nemesisguy/on-the-go-rentals-frontend:v0.1.0 -t nemesisguy/on-the-go-rentals-frontend:latest .  

docker push nemesisguy/on-the-go-rentals-frontend:latest

docker push nemesisguy/on-the-go-rentals-frontend:v0.1.0