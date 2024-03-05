package com.bluebetafish.chesswebapp.service;

import net.andreinc.neatchess.client.UCI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChessEngineService {
//    @Autowired
//    private UCI stockfishUciWrapper;

    @Autowired
    private UCI bluebetafishUciWrapper;

    public String getBestMove(String fen) {
        bluebetafishUciWrapper.uciNewGame();
        bluebetafishUciWrapper.positionFen(fen);
        var result10depth = bluebetafishUciWrapper.bestMove(1500L, 60000).getResultOrThrow();
        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());

        return result10depth.getCurrent();
    }

}
