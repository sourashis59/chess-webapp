package com.bluebetafish.chesswebapp.controller;

import net.andreinc.neatchess.client.UCI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.logging.Logger;

@Service
@RestController
@RequestMapping("/api")
public class ChessEngineController {

    @Autowired
    private UCI uci;


    @GetMapping("/bestmove")
    public String bestMove(@RequestParam String fen) {
        System.out.println("\n/bestmove  ----> fen: " + fen);

        uci.uciNewGame();
        uci.positionFen(fen);
        var result10depth = uci.bestMove(10).getResultOrThrow();
        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());
//        uci.positionFen(fen + " moves " + result10depth.getCurrent());

//        return "fen is: " + uci.getEngineInfo();
        return result10depth.getCurrent();
    }

}
