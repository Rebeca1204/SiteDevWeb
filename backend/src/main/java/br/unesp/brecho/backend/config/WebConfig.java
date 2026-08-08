package br.unesp.brecho.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia GET /uploads/** para a pasta física uploads/ no disco
        String location = "file:" + System.getProperty("user.dir") + "/" + uploadDir + "/";
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(location);
    }
}