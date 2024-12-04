package com.bluebetafish.chesswebapp.controller;

import com.bluebetafish.chesswebapp.model.BestMoveWebSocketRequest;
import com.bluebetafish.chesswebapp.model.BestMoveWebSocketResponse;
import com.bluebetafish.chesswebapp.service.ChessEngineService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import net.andreinc.neatchess.client.UCI;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class ChessWebSocketHandler extends TextWebSocketHandler {
    //*TODO: AUTOWIRE
    ChessEngineService chessEngineService = new ChessEngineService();
    ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, UCI> userEngineMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        UCI engine = new UCI();
        engine.startBluebetafish();
        engine.uciNewGame();
        userEngineMap.put(sessionId, engine);
//        session.sendMessage(new TextMessage("Connection established with ID: " + sessionId));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = session.getId();
        UCI engine = userEngineMap.get(userId);
        if (engine == null) {
            log.error("Error: Engine not found for user. SessionId: {}", session.getId());
            session.sendMessage(new TextMessage("Error: Engine not found for user."));
            return;
        }

        BestMoveWebSocketRequest request = objectMapper.readValue(message.getPayload(), BestMoveWebSocketRequest.class);
        BestMoveWebSocketResponse response  = new BestMoveWebSocketResponse("FAILED", "", -1, session.getId(), "");
        try {
            long moveTime = request.getMoveTime();
            //* keep some bound on the min and max time of moveTime
            //* dont take wrong input from user
            moveTime = Math.min(moveTime, 30);
            moveTime = Math.max(moveTime, 1);

            //* Received moveTime is in seconds. Convert it to ms
            moveTime *= 1000;
            var resultBestMove = chessEngineService.getBestMove(request.getFen(), moveTime, engine);
            response = new BestMoveWebSocketResponse("SUCCESS", request.getFen(), request.getMoveTime(), session.getId(), resultBestMove);
            log.info("BestMove response: {}", response);
        } catch (Exception exception) {
            log.error("BestMove failed for request: {}, exception: {}", request, exception.getStackTrace());
        }
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = session.getId();
        UCI engine = userEngineMap.remove(userId);
        if (engine != null) {
            engine.close();
        }
    }
}
