	.text
	.intel_syntax noprefix
	.file	"cap.c"
	.globl	cap_unsigned                    # -- Begin function cap_unsigned
	.p2align	4, 0x90
	.type	cap_unsigned,@function
cap_unsigned:                           # @cap_unsigned
# %bb.0:
	cmp	edi, 7
	mov	eax, 7
	cmovb	eax, edi
	ret
.Lfunc_end0:
	.size	cap_unsigned, .Lfunc_end0-cap_unsigned
                                        # -- End function
	.globl	cap_signed                      # -- Begin function cap_signed
	.p2align	4, 0x90
	.type	cap_signed,@function
cap_signed:                             # @cap_signed
# %bb.0:
	cmp	edi, 7
	mov	eax, 7
	cmovl	eax, edi
	ret
.Lfunc_end1:
	.size	cap_signed, .Lfunc_end1-cap_signed
                                        # -- End function
	.ident	"Ubuntu clang version 18.1.3 (1ubuntu1)"
	.section	".note.GNU-stack","",@progbits
	.addrsig
