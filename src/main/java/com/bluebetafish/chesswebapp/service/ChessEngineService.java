package com.bluebetafish.chesswebapp.service;

import net.andreinc.neatchess.client.UCI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalTime;

@Service
public class ChessEngineService {
//    @Autowired
//    private UCI stockfishUciWrapper;

//    @Autowired
//    private UCI bluebetafishUciWrapper;

    public String getBestMove(String fen, long moveTime) {

        /*
        * TODO:
        * for the current version of engine, if it is calculating for some position (obtained from some request r1)
        * and then some new request r2 comes and asks the engine to get best move for another position
        * then 'ucinewgame' command will be executed and we wont get the result for request r1
        *
        * So for each best move request we have to create a new engine instance.
        * We cant keep a list of engine instances and use them in round robin because of this reason.
        *
        * So for now, for each request, i am creating a new engine instance
        * and destroying it once the request is processed
        * */
        UCI bluebetafishUciWrapper = new UCI();

        System.out.println("\nReceived request: moveTime = " + moveTime + ", fen= " + fen);
        System.out.println("Time= " + LocalTime.now());

        bluebetafishUciWrapper.startBluebetafish();
        bluebetafishUciWrapper.uciNewGame();
        bluebetafishUciWrapper.positionFen(fen);

        //* be careful: if you pass int as first arg, then overloaded function bestMove(depth, timeout) is called,
        //* and if you pass long as first arg, then overloaded function bestMove(moveTime, timeout) is called
        //* timeout limit is 60sec now
        var result10depth = bluebetafishUciWrapper.bestMove(moveTime, 60000).getResultOrThrow();

        System.out.println("Best move after analysing 10 moves deep: " + result10depth.getCurrent());
        System.out.println("Time= " + LocalTime.now());

        //* destroy the instance(TODO: keep this in finally block in case of exceptions)
        bluebetafishUciWrapper.close();


        return result10depth.getCurrent();
    }

}
