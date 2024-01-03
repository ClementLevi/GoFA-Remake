#pragma once

#ifndef __SHIP_H_
    #include "SHIP.h"
#endif

#ifndef __IOSTREAM
    #include <iostream>
    #define __IOSTREAM
#endif
#ifndef __STRING
    #include <string>
    #define __STRING
#endif


#ifndef __PARTICIPANTS_H_
#define __PARTICIPANTS_H_
class Participant{
    private:
        Ship tmpl_F1=Ship(TYPE_F1);
        Ship tmpl_F2=Ship(TYPE_F2);
        Ship tmpl_B1=Ship(TYPE_B1);
        Ship tmpl_B2=Ship(TYPE_B2);
        Ship tmpl_I1=Ship(TYPE_I1);
        Ship tmpl_I2=Ship(TYPE_I2);

    public:
        int f1=0;
        int f2=0;
        int b1=0;
        int b2=0;
        int i1=0;
        int i2=0;
        float bonus_planetary_defence=1.0;
        float bonus_sniper = 1.0;
        float bonus_commander_lv = 1.0;

        Participant(void){}

        Participant(int f1, int f2, int b1, int b2, int i1, int i2, float bpd, float bs, float bcl){
            this->f1 = f1;
            this->f2 = f2;
            this->b1 = b1;
            this->b2 = b2;
            this->i1 = i1;
            this->i2 = i2;
            this->bonus_planetary_defence = bpd;
            this->bonus_sniper = bs;
            this->bonus_commander_lv = bcl;
        }

        void setAmount(int amount[6]){
            this->f1 = amount[0];
            this->f2 = amount[1];
            this->b1 = amount[2];
            this->b2 = amount[3];
            this->i1 = amount[4];
            this->i2 = amount[5];
        }

        void setBattlefieldArgs(float args[3]){
            this->bonus_planetary_defence = args[0];
            this->bonus_sniper = args[1];
            this->bonus_commander_lv = args[2];
        }

        float getAttack(ShipTypeEnum name){
            switch (name) {
                case 0: return this->f1 * tmpl_F1.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                case 1: return this->f2 * tmpl_F2.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                case 2: return this->b1 * tmpl_B1.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                case 3: return this->b2 * tmpl_B2.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                case 4: return this->i1 * tmpl_I1.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                case 5: return this->i2 * tmpl_I2.ATK * this->bonus_sniper * this->bonus_commander_lv; break;
                default: return -1; break;
            }
        }
        float getHp(ShipTypeEnum name){
            switch (name){
                case 0: return this->f1 * tmpl_F1.HP; break;
                case 1: return this->f2 * tmpl_F2.HP; break;
                case 2: return this->b1 * tmpl_B1.HP; break;
                case 3: return this->b2 * tmpl_B2.HP; break;
                case 4: return this->i1 * tmpl_I1.HP; break;
                case 5: return this->i2 * tmpl_I2.HP; break;
                default: return -1; break;
            }
        }
        float getShield(ShipTypeEnum name){
            switch (name){
                case 0: return this->f1 * tmpl_F1.SHIELD * this->bonus_commander_lv; break;
                case 1: return this->f2 * tmpl_F2.SHIELD * this->bonus_commander_lv; break;
                case 2: return this->b1 * tmpl_B1.SHIELD * this->bonus_commander_lv; break;
                case 3: return this->b2 * tmpl_B2.SHIELD * this->bonus_commander_lv; break;
                case 4: return this->i1 * tmpl_I1.SHIELD * this->bonus_commander_lv; break;
                case 5: return this->i2 * tmpl_I2.SHIELD * this->bonus_commander_lv; break;
                default: return -1; break;

            }
        }
};

#endif