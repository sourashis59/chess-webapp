package com.bluebetafish.chesswebapp.controller;

import com.bluebetafish.chesswebapp.service.ChessEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@Service
@RestController
@RequestMapping("/api")
public class ChessEngineController {
    @Autowired
    private ChessEngineService stockFishService;

    @GetMapping("/bestmove")
    public String bestMove(@RequestParam String fen) {
        return stockFishService.getBestMove(fen);
    }

}
