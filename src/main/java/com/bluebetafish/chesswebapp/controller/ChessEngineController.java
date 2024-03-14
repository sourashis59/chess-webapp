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
    public String bestMove(@RequestParam("fen") String fen,
                           @RequestParam("movetime") long moveTime) {
        //* keep some bound on the min and max time of moveTime
        //* dont take wrong input from user
        moveTime = Math.min(moveTime, 30);
        moveTime = Math.max(moveTime, 1);

        //* Received moveTime is in seconds. Convert it to ms
        moveTime *= 1000;

        return stockFishService.getBestMove(fen, moveTime);
    }

}
