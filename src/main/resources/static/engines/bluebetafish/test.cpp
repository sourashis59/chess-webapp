#include<bits/stdc++.h>

using namespace std;

int main() {
    
    while(1) {
        string input;
        // cin >> input;
        getline(cin, input);

        if (input == "uci" || input == "ucinewgame") {
            cout << "readyok\n";
        }
        else if (input.find("go") != string::npos) {
            cout << "YouEntered:" + input + "\n";
        } else {
            cout << "readyok\n";
        }
    }
    return 0;
}