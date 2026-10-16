FROM nginx:latest
RUN mkdir -p /etc/nginx/ssl
COPY ./ssl /etc/nginx/ssl/
RUN chmod 777 /etc/nginx
CMD ["nginx", "-g", "daemon off;"]
