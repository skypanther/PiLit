from enum import Enum, EnumMeta


class CustomEnumMeta(EnumMeta):
    """
    Overriding the default EnumMeta to enable searches by value. For example,
        if "foo" in my_enum
    Note that this overrides the default behavior that enables searches by members. For example:
        if my_enum.RED in my _num
    """

    def __contains__(cls, item):
        try:
            cls(item)
        except ValueError:
            return False
        else:
            return True


class EnumValueAliases(Enum, metaclass=CustomEnumMeta):
    """
    Enable a single Enum member to represent multiple values. For example:

        ```
        class EnumWithAliases(EnumValueAliases):
            RED = "red", "rouge"
            BLUE = "blue", "cerulean"

        print(EnumWithAliases("red"))      # EnumWithAliases.RED
        print(EnumWithAliases("rouge"))    # EnumWithAliases.RED

        ```
    """

    def __new__(cls, value, *value_aliases):
        obj = object.__new__(cls)
        obj._value_ = value
        for alias in value_aliases:
            if alias not in cls:
                # add the alias only if the value doesn't already exist directly
                cls._value2member_map_[alias] = obj
        return obj

    def __str__(self) -> str:
        return self.value
