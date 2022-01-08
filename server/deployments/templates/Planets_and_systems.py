import random as r
from hashlib import md5
import Buildings
import Buildings_info

class Planet:
    '''
| All the planets are generated following the rules below:
|   1. Receive a name from parameter transfered into "__init__"method;
|   2. Make random change to the attributes of this class, and apply them to the instance object;
|   3. A planet at this time is created, and its details like slots or resource output should be visited via
|       "visit" or "detail" method;
|   4. Front displayer should now get the appearance data from the instance object. The texture now
|       can vary.
'''
    __planet_size = 5
    __planet_rss_metal = 1
    __planet_rss_gas = 1
    __planet_rss_crystal = 1
    __planet_efficiency = 1
    __planet_types_pool = {
        0:"oceanic", 1:"icy", 2:"volcanic",
        3:"rocky", 4:"desert", 5:"jungle",
        6:"red_cit", 7:"yellow_cit", 8:"blue_cit",
        9:"fractured"
        }
# Haven't dicided whether to add a "fractured" planet in game.
    
    def __init__(self, system_name, num):
        """Generating a instance object and modify the original data from module "Random".
    This part contains :
| 1. Give the System name to Planet and order it;
| 2. Set Slots Number, Efficiency level and basic Resource Output;
|   | Slots:  [5, 12]   Efficieny: [1, 10]  Rss Output: [1, 10]
| 3. Set default onwer as a string "None" to enable colonization option;
| 4. Give the planet a appearance and thus enable spiecies bonus.
|   | Potentially, a planet will generate as a citadel, which the process is defined by
|   | the marked statements.
|
|  Parameters:
|   | system_name: the name of this system where planet attached to;
|   | num: die Ordnungszahlen of the planet, marking where its orbit should be.
Hoping to get a system or sector full of citadels?
Create a subclass and edit the probability the cits appear~
"""
        self.__planet_name = system_name.capitalize() + num # Naming
        self.__planet_size += r.randint(0,7)    # Setting size
        
        self.__planet_rss_metal += r.randint(0,9)   # RSS 
        self.__planet_rss_gas += r.randint(0,9)
        self.__planet_rss_crystal += r.randint(0,9)
        self.__planet_efficiency += r.randint(0,9)  # Efficiency
        
        self.planet_owner = "None"    # Default Owner
        self.__planet_type = self.__planet_types_pool[r.randint(0,5)]   #Appearance
        self.__planet_buildings = []    # Building slots and contents

        self.planet_storage = [50000, 50000, 50000, -1, -1, [-1, -1, -1, -1, -1, -1, -1, -1] ]      # Storange Limit
        self.planet_id = md5(bytes(self.__planet_name, 'utf-8')).hexdigest()  # Set planet MD5 ID
        
        for __count in range(self.__planet_size):     # Generating building slots(empty buildings)
            temp = Buildings.BaseBuilding(building_type= Buildings_info.buildings_list[0],
                 planet_id= self.planet_id )
            self.__planet_buildings.append(temp)
        
        # Generating citadel is less possible, which is 10% possibly to change a normal planet into a cit.
        __temp_generating_cit_possibility = r.randint(0,9)  # Want more cit? modify here!
        if __temp_generating_cit_possibility == 0:
            self.__planet_type = self.__planet_types_pool[r.randint(6,8)]
        
    def rss(self):
        """Briefly and simply return the size, Resource output and Efficiency of a planet."""
        return (self.__planet_size, self.__planet_rss_metal, self.__planet_rss_gas,
                self.__planet_rss_crystal, self.__planet_efficiency)

    def name(self):
        """Briefly and simply return the planet name."""
        return self.__planet_name

    def appearance(self):
        """Briefly and simply return the type of a planet."""
        return self.__planet_type

    def spied(self):
        return self.__planet_buildings, 

##    def owner(self):
##        """Briefly and simply return the owner of a planet.
##If the planet is unoccupied, return a string "None"."""
##        try:
##            return self.__planet_owner
##        except:
##            return self.__planet_default_owner

    def change_owner(self, player):
        """Change the planet owner to a player bearing the parameter 'name'. """
        print('lvdown')#Insert the building level down code here
        self.__planet_owner = player
        for eachBuilding in self.__planet_buildings:
            eachBuilding.attacked()

    def build(self, building):
        pass
    
class System:
    __system_appearance_pool = [
        'pink', 'red', 'orange',
        'yellow',  'lime', 'green',
        'water', 'blue', 'purple',
        'white', 'black_hole'
        ]
    # Why we need a system looks like a black hole???
    def __init__(self, location, name_input):
        
        def __create_planets(name, size):
            temp = []
            for planet_num in range(size):
                planet = Planet(name, str(planet_num + 1))
                temp.append(planet)
            return temp
            
        self.system_x = location[0] + r.uniform(-0.5,0.5)   # Random offset location
        self.system_y = location[1] + r.uniform(-0.5,0.5)
        self.system_appearance = r.choice(self.__system_appearance_pool)    # Appearance
        self.system_size = r.randint(1,7)   # Set System Size
        self.system_content = __create_planets(name_input, self.system_size)    # Create planets
        self.system_name = name_input   # Get System Name

        self.system_id = md5(bytes(self.system_name, 'utf-8')).hexdigest()  # Set system MD5 ID

        
    def appearance(self):
        return self.system_appearance

    def name(self):
        """Briefly and simply return the system name."""
        return self.system_name

    def visit(self):
        return self.system_content
    
    def detail(self, statement = False):
        def visit_planet():
                for i in self.visit():
                    __temp_list = []
                    __temp_list.append((i.name(), i.rss(), i.appearance(), i.owner()))
                return __temp_list
            
        if statement == False:
            return visit_planet()
        elif statement == True:
            _temp = ""
            for each in visit_planet():
                _temp += str(each[0:3]) + ', owned by' + each[3] + '\n'
            
            return "This system contains %d planets, which are listed as below:\n%s" % (self.system_size, _temp)

