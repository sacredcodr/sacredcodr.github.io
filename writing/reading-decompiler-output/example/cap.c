unsigned cap_unsigned(unsigned value)
{
    if (value > 7)
    {
        return 7;
    }
    return value;
}

int cap_signed(int value)
{
    if (value > 7)
    {
        return 7;
    }
    return value;
}
