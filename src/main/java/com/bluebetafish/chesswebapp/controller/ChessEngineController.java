package com.bluebetafish.chesswebapp.controller;

import com.bluebetafish.chesswebapp.service.StockFishService;
import net.andreinc.neatchess.client.UCI;
import net.andreinc.neatchess.client.exception.UCIRuntimeException;
import net.andreinc.neatchess.client.parser.BestMoveParser;
import net.andreinc.neatchess.client.processor.BestMoveProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Logger;

@Service
@RestController
@RequestMapping("/api")
public class ChessEngineController {

    @Autowired
    private StockFishService stockFishService;


    @GetMapping("/bestmove")
    public String bestMove(@RequestParam String fen) {

        return stockFishService.getBestMove(fen);


//        System.out.println("\n/bestmove  ----> fen: " + fen);
//
//        uci.uciNewGame();
//        uci.positionFen(fen);
////        var result10depth = uci.bestMove(10).getResultOrThrow();
////        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());
//
//        BestMoveProcessor bestMoveProcessor = new BestMoveProcessor();
//        BestMoveParser bestMoveParser = new BestMoveParser();
//
//        List<String> list = Arrays.asList(new String[]{"bestmove f2d3"});
//        var temp1 = list.stream();
//        var temp2 = temp1.filter(bestMoveParser::matches);
//        var temp3 = temp2.findFirst();
//        var temp4 = temp3.map(bestMoveParser::parse);
//        var temp5 =  temp4.orElseThrow(()->new UCIRuntimeException("Cannot find best movement in engine output!\n"));
//
//        bestMoveProcessor.process(list);
////        uci.positionFen(fen + " moves " + result10depth.getCurrent());
//
////        return result10depth.getCurrent();
//        return "empty";

//
//        fen = "rnb1k2r/p1p2ppp/4p3/8/1p6/1P3NP1/PKR2nBP/R2q4 b kq - 3 19";
//
//        UCI uci = new UCI();
//        uci.startStockfish();
////        uci.uciNewGame();
////        uci.positionFen(fen);
////        var result10depth = uci.bestMove(10).getResultOrThrow();
////        System.out.println("\n\n\nres=" + result10depth);
//
//        uci.uciNewGame();
//        uci.positionFen(fen);
//        var result10depth = uci.bestMove(10).getResultOrThrow();
//        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());
//
//        return result10depth.getCurrent();
        //
//        BestMoveProcessor bestMoveProcessor = new BestMoveProcessor();
//        BestMoveParser bestMoveParser = new BestMoveParser();
//
//        List<String> list = Arrays.asList(new String[]{"bestmove f2d3"});
//        var temp1 = list.stream();
//        var temp2 = temp1.filter(bestMoveParser::matches);
//        var temp3 = temp2.findFirst();
//        var temp4 = temp3.map(bestMoveParser::parse);
//        var temp5 =  temp4.orElseThrow(()->new UCIRuntimeException("Cannot find best movement in engine output!\n"));


//        bestMoveProcessor.process(list);
//        uci.positionFen(fen + " moves " + result10depth.getCurrent());

//        return result10depth.getCurrent();


    }

}
