#ifndef IOSTREAM
    #include <iostream>
    #define __IOSTREAM
#endif

#ifndef __SHIP_STATS_H_
    #include "SHIP_STATS.h"
#endif

#ifndef __Situation_H_
    #include "SITUATION.h"
#endif

#ifndef __TROOPS_H_
    #include "TROOPS.h"
#endif

Situation space_combat_LEGACY(const Situation combat_args){
    return combat_args;
}

using namespace std;
int main(void){

    Ship f1(TYPE_F1);
    cout << f1 << endl;

    Participant a;
    int amount[6] = {1,1,4,5,1,4};
    a.setAmount(amount);
    cout <<"In set [1,1,4,5,1,4], B1 ships has totally "<< a.getAttack(TYPE_B1)<< "ATK ability. (4*150 per fighter)" << endl;


    Troops landforce;
    landforce.setCount(100);
//    cout << "If those fighters conduct land support against 100 soldiers, they can kill" << landforce.bombed(B2) << "troops." << endl;
}