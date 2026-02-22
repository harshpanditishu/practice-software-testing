# Docker Compose File Explanation

This document explains each line of the `docker-compose.yml` file in simple terms.

---

## File Header

```yaml
version: '3.8'
```
**Explanation:** Specifies which version of Docker Compose syntax we're using. Version 3.8 is a modern, stable version with all the features we need.

---

## Services Section

```yaml
services:
```
**Explanation:** This section defines all the containers (services) that will run together. Think of it as a list of applications you want to start.

---

## Nginx Service

```yaml
  nginx:
```
**Explanation:** Starts the definition of our first service, named "nginx". This will be our web server.

```yaml
    build:
      context: ..
      dockerfile: Dockerfile.nginx
```
**Explanation:** 
- `build:` - Tells Docker to build an image from a Dockerfile (instead of downloading a pre-made image)
- `context: ..` - The build context is the parent directory (one level up from docker_compose_files)
- `dockerfile: Dockerfile.nginx` - The specific Dockerfile to use for building this image

```yaml
    container_name: nginx-container
```
**Explanation:** Gives the running container a friendly name "nginx-container" instead of a random name.

```yaml
    ports:
      - "8080:80"
```
**Explanation:** Maps ports between your computer and the container
- Left side (8080): Port on your computer
- Right side (80): Port inside the container
- You'll access the web server at `localhost:8080`

```yaml
    depends_on:
      - mysql
```
**Explanation:** Tells Docker to start the MySQL service before starting nginx. Ensures proper startup order.

```yaml
    networks:
      - app-network
```
**Explanation:** Connects this container to a network called "app-network" so it can communicate with other containers on the same network.

```yaml
    restart: unless-stopped
```
**Explanation:** If the container crashes, Docker will automatically restart it. It only won't restart if you manually stop it.

---

## MySQL Service

```yaml
  mysql:
```
**Explanation:** Starts the definition of our second service, named "mysql". This will be our database server.

```yaml
    build:
      context: ..
      dockerfile: Dockerfile.mysql
```
**Explanation:** 
- Builds the MySQL image from `Dockerfile.mysql`
- Uses the parent directory as the build context

```yaml
    container_name: mysql-container
```
**Explanation:** Names this container "mysql-container" for easy identification.

```yaml
    ports:
      - "3306:3306"
```
**Explanation:** Maps MySQL's default port (3306) from the container to your computer
- You can connect to the database at `localhost:3306`

```yaml
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp_db
      MYSQL_USER: myapp_user
      MYSQL_PASSWORD: myapp_password
```
**Explanation:** Sets environment variables inside the container:
- `MYSQL_ROOT_PASSWORD`: The password for the MySQL root user (admin)
- `MYSQL_DATABASE`: Creates a database named "myapp_db" automatically
- `MYSQL_USER`: Creates a regular user named "myapp_user"
- `MYSQL_PASSWORD`: Sets the password for "myapp_user"

```yaml
    volumes:
      - mysql-data:/var/lib/mysql
```
**Explanation:** Persists (saves) database data even if the container is deleted
- `mysql-data`: A named volume (defined at the bottom of the file)
- `/var/lib/mysql`: Where MySQL stores data inside the container

```yaml
    networks:
      - app-network
```
**Explanation:** Connects MySQL to the same network as nginx so they can talk to each other.

```yaml
    restart: unless-stopped
```
**Explanation:** Auto-restarts the MySQL container if it crashes, unless you manually stop it.

---

## Networks Section

```yaml
networks:
  app-network:
    driver: bridge
```
**Explanation:** Defines a custom network for our services
- `app-network`: The name of the network
- `driver: bridge`: Uses Docker's default bridge network type (allows containers to communicate)

---

## Volumes Section

```yaml
volumes:
  mysql-data:
  #What are the options other than local ?

    Common Docker volume drivers include:

    - **local**: Stores data on the host machine's disk (default)
    - **nfs**: Network File System for remote storage
    - **smb**: Server Message Block for Windows/network shares
    - **awsebs**: AWS Elastic Block Store
    - **gcepd**: Google Cloud Persistent Disk
    - **azurefile**: Azure File Share

    For most local development, `local` is sufficient. Remote drivers are useful for production setups requiring data access across multiple hosts.

    driver: local
```
**Explanation:** Defines a named volume for persistent storage
- `mysql-data`: The name of the volume (used by MySQL service above)
- `driver: local`: Stores the data on your local machine's disk

---

## Quick Summary

**What happens when you run `docker-compose up`?**

1. Docker creates a network called `app-network`
2. Docker creates a volume called `mysql-data` for database storage
3. Docker builds the MySQL image from `Dockerfile.mysql`
4. Docker starts the MySQL container first (because nginx depends on it)
5. Docker builds the nginx image from `Dockerfile.nginx`
6. Docker starts the nginx container
7. Both containers can now communicate with each other via `app-network`
8. Nginx is accessible at `http://localhost:8080`
9. MySQL is accessible at `localhost:3306`

**What happens to your data?**
- If you stop and remove the containers, your MySQL data is still safe in the `mysql-data` volume
- To completely remove everything including data, you need to run `docker-compose down -v`
