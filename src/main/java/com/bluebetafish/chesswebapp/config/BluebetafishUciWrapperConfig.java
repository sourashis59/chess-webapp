package com.bluebetafish.chesswebapp.config;

import net.andreinc.neatchess.client.UCI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BluebetafishUCIWrapperConfig {
    @Bean
    public UCI bluebetafishUCIWrapperConfig() {
        UCI uci = new UCI();
        uci.startBluebetafish();
        return uci;

    }
}
