package com.bluebetafish.chesswebapp.service;

import net.andreinc.neatchess.client.UCI;
import net.andreinc.neatchess.client.exception.UCIRuntimeException;
import net.andreinc.neatchess.client.parser.BestMoveParser;
import net.andreinc.neatchess.client.processor.BestMoveProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@Service
public class StockFishService {
    @Autowired
    private UCI stockfishUciWrapper;

    public String getBestMove(String fen) {
        stockfishUciWrapper.uciNewGame();
        stockfishUciWrapper.positionFen(fen);
        var result10depth = stockfishUciWrapper.bestMove(1500L, 60000).getResultOrThrow();
        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());

        return result10depth.getCurrent();
    }

}
