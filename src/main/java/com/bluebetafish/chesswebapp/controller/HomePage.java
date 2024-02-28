package com.bluebetafish.chesswebapp.controller;

import net.andreinc.neatchess.client.UCI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomePage {

    @GetMapping("/")
    public String homePage() {
        return "index.html";
    }


}
