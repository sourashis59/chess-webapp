package com.bluebetafish.chesswebapp.config;

import net.andreinc.neatchess.client.UCI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UCIWrapperConfig {
    @Bean
    public UCI uci() {
        UCI uci = new UCI();
        uci.startStockfish();
        return uci;
    }
}
