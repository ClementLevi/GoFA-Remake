import Buildings_info
import time
class BaseBuilding:
    building_lv = 1
    building_type = 0
    building_planet = 0
    buildings_list_reverse = {
    'None':0,
    'Headquarter':1,
    'Metal Production Plant':2,
    'Gas Production Plant':3,
    'Crystal Production Plant':4,
    'Shipyard':5,
    'Barracks':6,
    'Scan Radar Array':7,
    'Laboratory':8,
    'Trade Center':9,
    'Planet Defense':10,
    'Citadel':11
    }
    def __init__(self,
                 building_type,
                 planet_id):
        'Initialization. Default generate a None building (empty slot).'
        self.building_type = building_type  # The "type" here is always a string. So take it easy.
        self.building_planet = planet_id    # A house must attach to the ground
        
        self.__building_has_queue = Buildings_info.queuable[self.buildings_list_reverse[building_type]]
## ??? How can I get a key from the value? Of course I rewrote the dictionary~
        
##        if building_type == 'Laboratory':
##            self.lab_slot = {1:0,2:0,3:0}
        
    def upgrade(self):
        if self.building_lv <= 20:
            self._building_lv += 1
        else:
            return 0
                
##    def options(self, option_list):
##        return 0

    def attacked(self):
        if self.building_type != 0:
            self._building_lv -= 1
        
        if self._building_lv == 0:
            self.building_type = 0
            self.building_planet = None
            
        return self.lv()


##    def produce(self,item, number, bonus=1, ):
##        if self.production_queue[0] == False:
##            
##            self.production_queue[0] = True
##            self.production_queue[1] = number
##            self.production_queue[2] = number * self.producing_rate * bonus
##            return self.production_queue
