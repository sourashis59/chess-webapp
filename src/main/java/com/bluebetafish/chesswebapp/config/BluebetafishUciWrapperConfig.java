package com.bluebetafish.chesswebapp.config;

import net.andreinc.neatchess.client.UCI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BluebetafishUciWrapperConfig {
    @Bean
    public UCI bluebetafishUciWrapper() {
        UCI uci = new UCI();
        uci.startBluebetafish();
        return uci;

    }
}
