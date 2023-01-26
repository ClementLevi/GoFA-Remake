# Requirement: 'random' module
# Author: Clement Levi
# Python version: 3.8.2
from random import randint
# Module introduction:
'''This module can universally generate a branch of words which seemingly alike to those names of places exist
in our real life. The module contains a root list(three part, a prefix, a root, and a suffix), a generator and a limit
probe which can be used to see how many words it can actually generate from given root list.
| The limit probe has been fixed in the generator. It mainly uses a "fuse" to check if the list can come up with
| another new name within Fuse-times try.(I set it 10 millions continuous failed try)

| This module will ultimately generate a set rather than a list from its only function. But of caurse you can make it a
| list by using "list()".
| I made it a function to enable you to apply it to your own code. '''

# 模块介绍（中文版）
'''这个模块可以泛用地生成一大把单词，看起来就像真实存在的地名那样。模块主要包括一个词根清单（三部分，
一个前缀一个词根一个后缀），一个生成器和一个能用来检查名词最大生成数量的上限探测器。
| 上限探测器已经被集成到生成器中。它使用一个“保险丝”来检查生成器能否在其规定次数内再生成一个新的名词。
| （我设定的连续失败次数是一千万次）

| 最终，这个模组从唯一一个函数中导出的是一个集合，而不是一个列表。当然，您也可以用list()来把它做成列表。
| 我把它做成了函数，这样您就可以在自己的代码中使用它。'''

# The only function in this module


class name_generator:
    """Use this function to generate as much system names as you want randomly! If you need, it can also
print those thousands of names to a text file!"""

    # Initialization process
    def __init__(self):
        self.name_pool = set()
        self.fuse_count = 0
        # Root lists, containing three main part which can form a word in order.
        self.head = [
            "b", "p", "m", "f", "d", "t", "n", "l", "g",
            "k", "h", "j", "q", "x", "zh", "ch", "sh", "sch", "r", "z", "c", "s", "y", "w", "ad`", "ab`", "Y`",
            "O`", "El ",
            "A", "I", "U", "E", "O"
        ]  # 34

        self.body = [
            'a', 'ar', 'ad', 'ab', 'as', 'ah', 'ai', 'ack', 'an', 'am', 'ap', 'ar', 'as', 'at', 'au', 'aw', 'az', 'ay',
            'e', 'es', 'eb', 'ed', 'et', 'en', 'em', 'el', 'ee', 'eg', 'eh', 'ei', 'eck', 'eo', 'eu', 'eu', 'ez',
            'io', 'ig', 'ik', 'ib', 'il', 'im', 'in', 'ing', 'ip', 'iq', 'ir', 'is', 'iss', 'it', 'iv', 'ix', 'iz', 'ick',
            'oi', 'ob', 'ock', 'od', 'odd', 'of', 'og', 'oug', 'oh', 'ok', 'ol', 'ool', 'om', 'on', 'ool', 'oq', 'or', 'os', 'oss', 'ot', 'ou', 'ov', 'ox', 'oy', 'oz',
            'ua', 'ub', 'ud', 'uf', 'ug', 'uh', 'ui', 'uk', 'ul', 'um', 'un', 'up', 'ur', 'url', 'us', 'ut', 'uv', 'ux', 'uy', 'uz'
        ]  # 98

        self.end = [
            'ng', 'g', 'ior', 'nd', 'ly', 'ul', 'ck', 'an', 'or', 'ell', 'an', 'er', 'ar', 'or', 'ion'
        ]  # 15

    def countCapa(self):
        """Calculate maxmimum generating ability of this generator.
        formula: Capa = headroots * bodies * ends
        Returns the result number."""
        return len(self.head) * len(self.body) * len(self.end)

    def showCapa(self):
        """Similar to "countCapa" method, but now print it.
        No returned value."""
        print("Head:%s;\tBody:%s;\tEnd:%s;\nMaximum Capability:\t%s" %
              (len(self.head), len(self.body), len(self.end), self.countCapa()))

    def addRoot(self, string, dest):
        """Add a new word root to "dest"; "dest" must be "head", "body" or"end".
        The string should be not in destination set currently. Better not in.
        Return statue code, 0 and Error for failure and 1 for job finished."""
        if dest == 'head':
            dest = self.head
        elif dest == 'body':
            dest = self.body
        elif dest == 'end':
            dest = self.end
        else:
            raise NameError(
                "Destination set spelling worng. Must be 'head', 'body' or'end'.")
        if string not in dest:
            dest.append(string)
            return 1
        else:
            return 0

    def showRoot(self):
        """To show all current word roots here in an elegant way.
        I meant, list them here.
        Return the three lists."""
        print(
            "------ Head:  %s  ------\
        \n%s\
        \n------ Body:  %s  ------\
        \n%s\
        \n------ End:\  %s  ------\
        \n%s" % (len(self.head), self.head, len(self.body), self.body, len(self.end), self.end)
        )
        return self.head, self.body, self.end

    def generate(self, number=-1):
        """Start generating procedure.
        number -> how many names do you want. -1 for "as much as possible".
        Return a name set."""
        if number == -1:
            number = self.countCapa()
        else:
            number = int(number)

        while len(self.name_pool) < number:  # Counter for generating specific number of names
            # While the length of 3 pools is 28, 98, 15, this can generate at most about 34104 names due to the possibility.
            # If you need more than that, plz add elements into the pools and recalculate the limit.

            # Probe to check if a name is indeedly added to the set.
            test = len(self.name_pool)

            temp = self.head[randint(0, len(self.head)-1)] \
                + self.body[randint(0, len(self.body)-1)] \
                + self.end[randint(0, len(self.end)-1)
                           ]        # ??? I don't know why r.choice dosen't work here.
            # Upper the first character in each word.
            self.name_pool.add(temp.title())

            # If the length of set didn't change during this try:
            if test == len(self.name_pool):
                self.fuse_count += 1  # Fuse heat up
                # And when the fuse has been detonated 10 million times:
                if self.fuse_count > 10000000:
                    # Okay, that's all' o' em
                    print('Too much names required.')
                    break
            else:  # If it still work in next try:
                self.fuse_count = 0  # Fuse cool down to zero

        print("%s system names successfully generated! " % len(self.name_pool))
        # if need to return a list instead of a set, plz list(it)!
        return self.name_pool


if __name__ == "__main__":
    a = name_generator()
    a.showRoot()
    a.addRoot('Forexample', 'head')
    a.showCapa()
    a.showRoot()
    print(list(a.generate(500)))
